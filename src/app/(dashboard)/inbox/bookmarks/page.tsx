"use client";

import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import InboxNotificationItem from "../components/InboxNotificationItem";
import { useBookmarkedNotifications } from "../hooks/useBookmarkedNotifications";
import { useNotificationFormatter } from "../hooks/useNotificationFormatter";

const BookmarksPage = () => {
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const isDark = themeMode === 'dark';
  const {
    notifications,
    enhancedCounts,
    loading,
    error,
    pagination,

    // Actions
    removeBookmark,
    markAsRead,
    archiveNotification,
    deleteNotification,

    // Selection
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    hasSelection,
    selectNotification,
    deselectNotification,
    toggleSelection,
    selectAll,
    deselectAll,

    // Bulk actions
    removeMultipleBookmarks,
    archiveMultiple,
    deleteMultiple,

    // Data fetching
    refreshBookmarks,
    setPage,
  } = useBookmarkedNotifications();

  const { getNotificationIcon, getNotificationColor } = useNotificationFormatter();

  // Add loading state for language
  if (languageLoading || !messages || !messages.bookmarks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p style={{ color: theme.status.error }} className="mb-4">{messages.bookmarks?.error?.loading || "Error loading bookmarked notifications"}</p>
          <button
            onClick={refreshBookmarks}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: theme.button.primary.background,
              color: theme.button.primary.text
            }}
          >
            {messages.bookmarks?.error?.retry || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  {messages.bookmarks.title}
                </h1>
                <p style={{ color: theme.text.secondary }}>
                  {messages.bookmarks.subtitle}
                </p>
              </div>
              {enhancedCounts && (
                <div className="text-right">
                  <div className="text-sm" style={{ color: theme.text.muted }}>
                    {enhancedCounts.bookmarkedCount} {messages.bookmarks.status.bookmarked}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {hasSelection && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{ backgroundColor: theme.background.secondary }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                    {messages.bookmarks.actions.selected.replace('{count}', selectedCount.toString())}
                  </span>
                  <button
                    onClick={deselectAll}
                    className="text-sm hover:underline"
                    style={{ color: theme.button.primary.background }}
                  >
                    {messages.bookmarks.actions.clearSelection}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => removeMultipleBookmarks(Array.from(selectedIds))}
                    className="px-3 py-1 text-sm rounded hover:opacity-90"
                    style={{
                      backgroundColor: theme.status.warning,
                      color: '#ffffff'
                    }}
                  >
                    {messages.bookmarks.actions.removeBookmarks}
                  </button>
                  <button
                    onClick={() => archiveMultiple(Array.from(selectedIds))}
                    className="px-3 py-1 text-sm rounded hover:opacity-90"
                    style={{
                      backgroundColor: theme.status.success,
                      color: '#ffffff'
                    }}
                  >
                    {messages.bookmarks.actions.archive}
                  </button>
                  <button
                    onClick={() => deleteMultiple(Array.from(selectedIds))}
                    className="px-3 py-1 text-sm rounded hover:opacity-90"
                    style={{
                      backgroundColor: theme.status.error,
                      color: '#ffffff'
                    }}
                  >
                    {messages.bookmarks.actions.delete}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Select All Checkbox */}
          {notifications.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={isAllSelected ? deselectAll : selectAll}
                  className="rounded shadow-sm focus:ring focus:ring-opacity-50"
                  style={{
                    borderColor: theme.border.default,
                    accentColor: theme.button.primary.background
                  }}
                />
                <span className="text-sm" style={{ color: theme.text.secondary }}>
                  {messages.bookmarks.actions.selectAll}
                </span>
              </label>
            </div>
          )}

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: theme.button.primary.background }}
              ></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.text.muted }}>
              <div className="text-4xl mb-4">🔖</div>
              <h3 className="text-lg font-medium mb-2">{messages.bookmarks.empty.title}</h3>
              <p>{messages.bookmarks.empty.description}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <InboxNotificationItem
                  key={notification.id}
                  notification={notification}
                  isSelected={isSelected(notification.id)}
                  onSelect={() => selectNotification(notification.id)}
                  onDeselect={() => deselectNotification(notification.id)}
                  onToggleSelection={() => toggleSelection(notification.id)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onBookmark={() => removeBookmark(notification.id)}
                  onArchive={() => archiveNotification(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                  isBookmarkPage={true}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm" style={{ color: theme.text.muted }}>
                {messages.bookmarks.pagination.showing
                  .replace('{start}', ((pagination.page * pagination.size) + 1).toString())
                  .replace('{end}', Math.min((pagination.page + 1) * pagination.size, pagination.totalElements).toString())
                  .replace('{total}', pagination.totalElements.toString())}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{
                    backgroundColor: pagination.hasPrevious ? theme.button.primary.background : theme.button.secondary.background,
                    color: pagination.hasPrevious ? theme.button.primary.text : theme.text.muted,
                    cursor: pagination.hasPrevious ? 'pointer' : 'not-allowed'
                  }}
                >
                  {messages.bookmarks.pagination.previous}
                </button>

                <span className="text-sm" style={{ color: theme.text.muted }}>
                  {messages.bookmarks.pagination.page
                    .replace('{current}', (pagination.page + 1).toString())
                    .replace('{total}', pagination.totalPages.toString())}
                </span>

                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{
                    backgroundColor: pagination.hasNext ? theme.button.primary.background : theme.button.secondary.background,
                    color: pagination.hasNext ? theme.button.primary.text : theme.text.muted,
                    cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                  }}
                >
                  {messages.bookmarks.pagination.next || 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
