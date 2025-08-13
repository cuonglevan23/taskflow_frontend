"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { BaseNotification, NotificationActions } from "@/contexts/NotificationContext";
import { useDetailPanel } from "@/contexts/DetailPanelContext";
import { Clock, Star, Archive, MoreHorizontal, Check, X } from "lucide-react";

interface UnifiedInboxNotificationItemProps {
  notification: BaseNotification;
  actions: NotificationActions;
  isLoading?: boolean;
  isSelected?: boolean;
  showMoreMenu?: boolean;
  onToggleSelection?: (id: string) => void;
  onHideMoreActions?: () => void;
}

const UnifiedInboxNotificationItem = ({
  notification,
  actions,
  isLoading = false,
  isSelected = false,
  showMoreMenu = false,
  onToggleSelection,
  onHideMoreActions,
}: UnifiedInboxNotificationItemProps) => {
  const { theme } = useTheme();
  const { openPanel } = useDetailPanel();

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return theme.text.secondary;
    }
  };

  // Type icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '📋';
      case 'project': return '📁';
      case 'message': return '💬';
      case 'reminder': return '⏰';
      case 'system': return '⚙️';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const handleClick = () => {
    // Mark as read when clicked
    if (!notification.isRead) {
      actions.markAsRead(notification.id);
    }

    openPanel({
      id: notification.id,
      type: "notification",
      title: notification.title,
      content: notification.content || notification.message || notification.title,
      time: notification.timestamp.toLocaleString(),
      avatar: notification.avatar || getTypeIcon(notification.type),
      isRead: notification.isRead,
      isBookmarked: notification.isBookmarked,
    });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.isBookmarked) {
      actions.unbookmark(notification.id);
    } else {
      actions.bookmark(notification.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.archive(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.isRead) {
      actions.markAsUnread(notification.id);
    } else {
      actions.markAsRead(notification.id);
    }
  };

  const handleMoreActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.showMoreActions?.(notification.id);
  };

  const handleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(notification.id);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div
      className={`group relative flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        backgroundColor: notification.isRead
          ? theme.background.primary
          : theme.background.secondary,
        borderLeft: `3px solid ${
          notification.isRead ? "transparent" : getPriorityColor(notification.priority)
        }`,
      }}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      {onToggleSelection && (
        <div
          className="flex-shrink-0 w-4 h-4 mt-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleSelection}
        >
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      {/* Avatar/Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
        style={{
          backgroundColor: theme.background.secondary,
          color: theme.text.primary,
        }}
      >
        {notification.avatar || getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div 
              className={`font-medium ${notification.isRead ? '' : 'font-semibold'}`}
              style={{ color: theme.text.primary }}
            >
              {notification.title}
            </div>
            
            {/* Priority indicator */}
            {notification.priority !== 'low' && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getPriorityColor(notification.priority) }}
                title={`${notification.priority} priority`}
              />
            )}
          </div>

          {/* Time */}
          <div 
            className="text-xs flex-shrink-0 ml-2"
            style={{ color: theme.text.secondary }}
          >
            {formatTime(notification.timestamp)}
          </div>
        </div>

        {/* Content preview */}
        {(notification.content || notification.message) && (
          <div
            className="text-sm mb-2 line-clamp-2"
            style={{ color: theme.text.secondary }}
          >
            {notification.content || notification.message}
          </div>
        )}

        {/* Action URL */}
        {notification.actionUrl && notification.actionText && (
          <div className="flex items-center gap-1 text-xs">
            <span 
              className="text-blue-500 hover:text-blue-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = notification.actionUrl!;
              }}
            >
              {notification.actionText}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Mark as read/unread */}
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleMarkAsRead}
          disabled={isLoading}
          title={notification.isRead ? "Mark as unread" : "Mark as read"}
        >
          {notification.isRead ? (
            <X className="w-4 h-4" style={{ color: theme.text.secondary }} />
          ) : (
            <Check className="w-4 h-4" style={{ color: theme.text.secondary }} />
          )}
        </button>

        {/* Bookmark */}
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleBookmark}
          disabled={isLoading}
          title={notification.isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Star 
            className={`w-4 h-4 ${notification.isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`}
            style={{ color: notification.isBookmarked ? '#fbbf24' : theme.text.secondary }}
          />
        </button>

        {/* Archive */}
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleArchive}
          disabled={isLoading}
          title="Archive"
        >
          <Archive className="w-4 h-4" style={{ color: theme.text.secondary }} />
        </button>

        {/* More actions */}
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleMoreActions}
          disabled={isLoading}
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: theme.text.secondary }} />
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* More actions menu */}
      {showMoreMenu && (
        <div
          className="absolute right-4 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[150px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              actions.removeNotification(notification.id);
              onHideMoreActions?.();
            }}
            style={{ color: theme.text.primary }}
          >
            Delete notification
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Copy notification link or details
              navigator.clipboard.writeText(notification.title);
              onHideMoreActions?.();
            }}
            style={{ color: theme.text.primary }}
          >
            Copy details
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedInboxNotificationItem;