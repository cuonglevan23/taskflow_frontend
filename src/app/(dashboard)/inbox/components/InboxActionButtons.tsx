"use client";

import React, { useState } from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { FormattedNotification } from "../hooks/useNotificationFormatter";
import {
  Bookmark,
  Archive,
  Trash2,
  MoreHorizontal,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

interface InboxActionButtonsProps {
  notification: FormattedNotification;
  onMarkAsRead?: () => void;
  onMarkAsUnread?: () => void;
  onBookmark?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  isBookmarkPage?: boolean;
  isArchivePage?: boolean;
}

const InboxActionButtons = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onBookmark,
  onArchive,
  onDelete,
  isBookmarkPage = false,
  isArchivePage = false,
}: InboxActionButtonsProps) => {
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const isDark = themeMode === 'dark';
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Add loading state for language
  if (languageLoading || !messages || !messages.notifications) {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-6 h-6 animate-pulse bg-gray-300 rounded"></div>
        <div className="w-6 h-6 animate-pulse bg-gray-300 rounded"></div>
        <div className="w-6 h-6 animate-pulse bg-gray-300 rounded"></div>
      </div>
    );
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.();
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.();
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsUnread?.();
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <div className="flex items-center space-x-1 relative">
      {/* Primary Actions */}
      <div className="flex items-center space-x-1">
        {/* Mark as Read/Unread */}
        {!notification.isRead ? (
          <button
            onClick={handleMarkAsRead}
            className="p-1.5 rounded-md transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: theme.status.success
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={messages.notifications.actions.markAsRead}
          >
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleMarkAsUnread}
            className="p-1.5 rounded-md transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: theme.text.muted
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={messages.notifications.actions.markAsUnread}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        )}

        {/* Bookmark/Unbookmark */}
        {!isBookmarkPage && (
          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-md transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: notification.isBookmarked ? theme.status.warning : theme.text.muted
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={notification.isBookmarked ? messages.notifications.actions.removeBookmark : messages.notifications.actions.bookmark}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}

        {/* Archive/Unarchive */}
        <button
          onClick={handleArchive}
          className="p-1.5 rounded-md transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: theme.button.primary.background
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={isArchivePage ? messages.notifications.actions.unarchive : messages.notifications.actions.archive}
        >
          <Archive className="w-4 h-4" />
        </button>

        {/* More Actions */}
        <button
          onClick={handleMoreClick}
          className="p-1.5 rounded-md transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: theme.text.muted
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={messages.notifications.actions.moreActions}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* More Actions Menu */}
      {showMoreMenu && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg z-10"
          style={{
            backgroundColor: theme.dropdown.background,
            borderColor: theme.border.default,
            borderWidth: '1px',
            boxShadow: `0 10px 15px -3px ${theme.dropdown.shadow}`
          }}
        >
          <div className="py-1">
            {/* Remove Bookmark (only on bookmark page) */}
            {isBookmarkPage && (
              <button
                onClick={handleBookmark}
                className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                style={{
                  color: theme.text.primary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.dropdown.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Bookmark className="w-4 h-4 mr-3" />
                {messages.notifications.actions.removeBookmark}
              </button>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm transition-colors"
              style={{
                color: theme.status.error,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 242, 242, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              {messages.notifications.actions.delete}
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </div>
  );
};

export default InboxActionButtons;
