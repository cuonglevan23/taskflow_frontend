"use client";

import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { FormattedNotification } from "../hooks/useNotificationFormatter";
import InboxActionButtons from "./InboxActionButtons";
import { useDetailPanel } from "@/contexts/DetailPanelContext";

interface InboxNotificationItemProps {
  notification: FormattedNotification;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  onToggleSelection?: () => void;
  onMarkAsRead?: () => void;
  onMarkAsUnread?: () => void;
  onBookmark?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  getIcon?: (type: string) => string;
  getColor?: (type: string, isRead: boolean) => string;
  isBookmarkPage?: boolean;
  isArchivePage?: boolean;
  onClick?: () => void | Promise<void>;
}

const InboxNotificationItem = ({
  notification,
  isSelected = false,
  onSelect,
  onDeselect,
  onToggleSelection,
  onMarkAsRead,
  onMarkAsUnread,
  onBookmark,
  onArchive,
  onDelete,
  getIcon,
  getColor,
  isBookmarkPage = false,
  isArchivePage = false,
  onClick,
}: InboxNotificationItemProps) => {
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const isDark = themeMode === 'dark';

  // Add loading state for language
  if (languageLoading || !messages || !messages.notifications) {
    return (
      <div className="p-4 rounded-lg border animate-pulse" style={{ backgroundColor: theme.background.secondary, borderColor: theme.border.default }}>
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: isSelected
          ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
          : theme.background.secondary,
        borderColor: isSelected
          ? theme.button.primary.background
          : theme.border.default,
        borderLeftWidth: !notification.isRead ? '4px' : '1px',
        borderLeftColor: !notification.isRead ? theme.button.primary.background : theme.border.default
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 pt-1">
          <span className="text-lg">
            {getIcon ? getIcon(notification.type) : '🔔'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className="text-sm font-medium"
                style={{
                  color: notification.isRead ? theme.text.secondary : theme.text.primary
                }}
              >
                {notification.title}
              </h4>

              {notification.content && (
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.text.muted }}
                >
                  {notification.content}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-2">
                <span
                  className="text-xs"
                  style={{ color: theme.text.muted }}
                >
                  {notification.relativeTime}
                </span>

                {notification.senderName && (
                  <span
                    className="text-xs"
                    style={{ color: theme.text.muted }}
                  >
                    {messages.notifications.status.by} {notification.senderName}
                  </span>
                )}

                {notification.isBookmarked && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.status.warning }}
                  >
                    🔖 {messages.notifications.status.bookmarked}
                  </span>
                )}

                {notification.isOverdue && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.status.error }}
                  >
                    ⚠️ {messages.notifications.status.overdue}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <InboxActionButtons
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onMarkAsUnread={onMarkAsUnread}
          onBookmark={onBookmark}
          onArchive={onArchive}
          onDelete={onDelete}
          isBookmarkPage={isBookmarkPage}
          isArchivePage={isArchivePage}
        />
      </div>
    </div>
  );
};

export default InboxNotificationItem;
