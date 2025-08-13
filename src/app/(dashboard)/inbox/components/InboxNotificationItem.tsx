"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { InboxNotification, InboxActions } from "../hooks/useInboxActions";
import InboxActionButtons from "./InboxActionButtons";
import { useDetailPanel } from "@/contexts/DetailPanelContext";

interface InboxNotificationItemProps {
  notification: InboxNotification;
  actions: InboxActions;
  isLoading?: boolean;
  showMoreMenu?: boolean;
  onHideMoreActions?: () => void;
}

const InboxNotificationItem = ({
  notification,
  actions,
  isLoading = false,
  showMoreMenu = false,
  onHideMoreActions,
}: InboxNotificationItemProps) => {
  const { theme } = useTheme();
  const { openPanel } = useDetailPanel();

  const handleClick = () => {
    openPanel({
      id: notification.id,
      type: "notification",
      title: notification.title,
      content: notification.content || notification.title,
      time: notification.time,
      avatar: notification.avatar,
      isRead: notification.isRead,
      isBookmarked: notification.isBookmarked,
    });
  };

  return (
    <div
      className="group relative flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors"
      style={{
        backgroundColor: notification.isRead
          ? theme.background.primary
          : theme.background.secondary,
        borderLeft: `3px solid ${
          notification.isRead ? "transparent" : theme.button.primary.background
        }`,
      }}
      onClick={handleClick}
    >
      {/* Avatar */}
      {notification.avatar && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          style={{
            backgroundColor: theme.background.secondary,
            color: theme.text.primary,
          }}
        >
          {notification.avatar}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="font-medium mb-1" style={{ color: theme.text.primary }}>
          {notification.title}
        </div>

        {/* Content preview */}
        {notification.content && (
          <div
            className="text-sm mb-2 line-clamp-2"
            style={{ color: theme.text.secondary }}
          >
            {notification.content}
          </div>
        )}

        {/* Time */}
        <div className="text-xs" style={{ color: theme.text.secondary }}>
          {notification.time}
        </div>
      </div>

      {/* Action Buttons */}
      <InboxActionButtons
        notification={notification}
        actions={actions}
        isLoading={isLoading}
        showMoreMenu={showMoreMenu}
        onHideMoreActions={onHideMoreActions}
      />
    </div>
  );
};

export default InboxNotificationItem;
