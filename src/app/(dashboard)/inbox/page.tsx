"use client";

import React from "react";

import InboxNotificationItem from "./components/InboxNotificationItem";
import FilterSortControls from "./components/FilterSortControls";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useInbox } from "./hooks/useInbox";

export default function InboxPage() {
  const { theme } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();

  const {
    // Data
    notifications,
    groupedNotifications,
    enhancedCounts,
    loading,
    error,

    // Filters and sorting
    filters,
    sortOptions,
    setFilters,
    setSortOptions,

    // Pagination
    pagination,
    setPage,
    setPageSize,

    // Actions
    refreshInbox,
    markAsRead,
    markAsUnread,
    toggleBookmark,
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
    toggleSelectAll,

    // Bulk actions
    bulkActions,

    // Utilities
    getNotificationIcon,
    getNotificationColor
  } = useInbox();

  // Add loading state for language
  if (languageLoading || !messages || !messages.inbox) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: theme.status.info }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <p className="mb-4" style={{ color: theme.status.error }}>
            {messages.inbox?.error?.loading || "Error loading notifications"}
          </p>
          <button
            onClick={refreshInbox}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: theme.button.primary.background,
              color: theme.button.primary.text
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.primary.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.primary.background;
            }}
          >
            {messages.inbox?.error?.retry || "Retry"}
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
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              {messages.inbox.title}
            </h1>
            <p style={{ color: theme.text.secondary }}>
              {messages.inbox.subtitle}
            </p>
          </div>

          {/* Filters and Controls */}
          <FilterSortControls
            filters={filters}
            sortOptions={sortOptions}
            onFiltersChange={setFilters}
            onSortChange={setSortOptions}
            selectedCount={selectedCount}
            hasSelection={hasSelection}
            onBulkMarkAsRead={bulkActions.markSelectedAsRead}
            onBulkArchive={bulkActions.archiveSelected}
            onBulkDelete={bulkActions.deleteSelected}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />

          {/* Notifications List */}
          {loading ? (
            <div
              className="flex items-center justify-center h-32"
              style={{ backgroundColor: theme.background.primary }}
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: theme.status.info }}
              ></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.text.muted }}>
              <div className="text-4xl mb-4">📪</div>
              <h3 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
                {messages.inbox.empty.title}
              </h3>
              <p style={{ color: theme.text.muted }}>
                {messages.inbox.empty.description}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedNotifications.map((group) => (
                <div key={group.groupKey} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                      {group.groupLabel}
                    </h3>
                    {group.unreadCount > 0 && (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: theme.status.info + '20',
                          color: theme.status.info
                        }}
                      >
                        {group.unreadCount} {messages.inbox.status.unread}
                      </span>
                    )}
                  </div>

                  {/* Group Notifications */}
                  <div className="space-y-2">
                    {group.notifications.map((notification) => (
                      <InboxNotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={isSelected(notification.id)}
                        onSelect={() => selectNotification(notification.id)}
                        onDeselect={() => deselectNotification(notification.id)}
                        onToggleSelection={() => toggleSelection(notification.id)}
                        onMarkAsRead={() => markAsRead(notification.id)}
                        onMarkAsUnread={() => markAsUnread(notification.id)}
                        onBookmark={() => toggleBookmark(notification.id)}
                        onArchive={() => archiveNotification(notification.id)}
                        onDelete={() => deleteNotification(notification.id)}
                        getIcon={getNotificationIcon}
                        getColor={getNotificationColor}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm" style={{ color: theme.text.muted }}>
                {messages.inbox.pagination.showing
                  .replace('{start}', ((pagination.page * pagination.size) + 1).toString())
                  .replace('{end}', Math.min((pagination.page + 1) * pagination.size, pagination.totalElements).toString())
                  .replace('{total}', pagination.totalElements.toString())}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: pagination.hasPrevious ? theme.button.secondary.background : theme.background.muted,
                    color: pagination.hasPrevious ? theme.button.secondary.text : theme.text.muted,
                    borderColor: pagination.hasPrevious ? theme.button.secondary.border : theme.border.muted,
                    border: '1px solid',
                    cursor: pagination.hasPrevious ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.hasPrevious) {
                      e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.hasPrevious) {
                      e.currentTarget.style.backgroundColor = theme.button.secondary.background;
                    }
                  }}
                >
                  {messages.inbox.pagination.previous}
                </button>

                <span className="text-sm" style={{ color: theme.text.muted }}>
                  {messages.inbox.pagination.page
                    .replace('{current}', (pagination.page + 1).toString())
                    .replace('{total}', pagination.totalPages.toString())}
                </span>

                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: pagination.hasNext ? theme.button.secondary.background : theme.background.muted,
                    color: pagination.hasNext ? theme.button.secondary.text : theme.text.muted,
                    borderColor: pagination.hasNext ? theme.button.secondary.border : theme.border.muted,
                    border: '1px solid',
                    cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.hasNext) {
                      e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.hasNext) {
                      e.currentTarget.style.backgroundColor = theme.button.secondary.background;
                    }
                  }}
                >
                  {messages.inbox.pagination.next || 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
