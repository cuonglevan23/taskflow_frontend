"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { ACTION_ICONS, PROJECT_ICONS } from "@/constants/icons";
import { InboxNotification, InboxActions } from "../hooks/useInboxActions";
import { Button } from "@/components/ui";

interface InboxActionButtonsProps {
  notification: InboxNotification;
  actions: InboxActions;
  isLoading?: boolean;
  showMoreMenu?: boolean;
  onHideMoreActions?: () => void;
}

const InboxActionButtons: React.FC<InboxActionButtonsProps> = ({
  notification,
  actions,
  isLoading = false,
  showMoreMenu = false,
  onHideMoreActions,
}) => {
  const { theme } = useTheme();

  const handleMoreActions = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    actions.showMoreActions(notification.id);
  };

  const handleBookmark = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (notification.isBookmarked) {
      actions.unbookmark(notification.id);
    } else {
      actions.bookmark(notification.id);
    }
  };

  const handleArchive = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    actions.archive(notification.id);
  };

  const handleMoreMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();

    switch (action) {
      case "markAsRead":
        actions.markAsRead(notification.id);
        break;
      case "markAsUnread":
        actions.markAsUnread(notification.id);
        break;
    }

    onHideMoreActions?.();
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* More Actions Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMoreActions}
          disabled={isLoading}
          className="!p-2"
          icon={
            <ACTION_ICONS.menu
              className="w-4 h-4"
              style={{ color: theme.text.muted }}
            />
          }
        />

        {/* More Actions Dropdown */}
        {showMoreMenu && (
          <>
            {/* Overlay to close menu when clicking outside */}
            <div className="fixed inset-0 z-10" onClick={onHideMoreActions} />

            <div
              className="absolute right-0 top-full mt-1 py-2 w-48 rounded-lg shadow-lg z-20 border"
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default,
              }}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
                style={{ color: theme.text.primary }}
                onClick={(e) =>
                  handleMoreMenuAction(
                    notification.isRead ? "markAsUnread" : "markAsRead",
                    e
                  )
                }
              >
                {notification.isRead ? "Mark as unread" : "Mark as read"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bookmark Button */}
      <div
        title={
          notification.isBookmarked ? "Remove bookmark" : "Add to bookmarks"
        }
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          disabled={isLoading}
          className="!p-2"
          icon={
            <PROJECT_ICONS.bookmark
              className="w-4 h-4"
              style={{
                color: notification.isBookmarked
                  ? theme.button.primary.background
                  : theme.text.muted,
              }}
            />
          }
        />
      </div>

      {/* Archive Button */}
      <div title="Archive notification">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          disabled={isLoading}
          className="!p-2"
          icon={
            <ACTION_ICONS.download
              className="w-4 h-4"
              style={{ color: theme.text.muted }}
            />
          }
        />
      </div>
    </div>
  );
};

export default InboxActionButtons;
