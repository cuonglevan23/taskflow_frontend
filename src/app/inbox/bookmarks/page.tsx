"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import InboxNotificationItem from "../components/InboxNotificationItem";
import { useInboxActions, InboxNotification } from "../hooks/useInboxActions";
import FilterSortControls from "../components/FilterSortControls";

// Get bookmarked notifications from localStorage or global state
const getBookmarkedNotifications = (): InboxNotification[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("bookmarkedNotifications");
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const BookmarksPage = () => {
  const { theme } = useTheme();

  const bookmarkedNotifications = getBookmarkedNotifications();

  const { notifications, actions, showMoreMenu, hideMoreActions, isLoading } =
    useInboxActions(bookmarkedNotifications, (updatedNotifications) => {
      // Update localStorage when bookmarked notifications change
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "bookmarkedNotifications",
          JSON.stringify(updatedNotifications)
        );
      }
    });

  const handleNotificationClick = (notification: InboxNotification) => {
    console.log("Bookmarked notification clicked:", notification);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Filter and Sort Controls */}
      <div
        className="flex items-center justify-end mb-6 pb-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <FilterSortControls />
      </div>

      {/* Bookmarked Notifications */}
      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <InboxNotificationItem
              key={notification.id}
              notification={notification}
              actions={actions}
              isLoading={isLoading(notification.id)}
              showMoreMenu={showMoreMenu === notification.id}
              onHideMoreActions={hideMoreActions}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16" style={{ color: theme.text.muted }}>
          <div className="mb-4">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.background.secondary }}
            >
              <span className="text-2xl">🔖</span>
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              No bookmarked notifications
            </h3>
            <p>Bookmark important notifications to find them here later.</p>
          </div>
        </div>
      )}

      {/* Loading Feedback */}
      {Object.values(isLoading).some(Boolean) && (
        <div
          className="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
          style={{
            backgroundColor: theme.background.secondary,
            border: `1px solid ${theme.border.default}`,
            color: theme.text.primary,
          }}
        >
          Processing action...
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
