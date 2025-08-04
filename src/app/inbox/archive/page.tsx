"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import InboxNotificationItem from "../components/InboxNotificationItem";
import { useInboxActions, InboxNotification } from "../hooks/useInboxActions";
import FilterSortControls from "../components/FilterSortControls";

const ArchivePage = () => {
  const { theme } = useTheme();
  const [archivedNotifications, setArchivedNotifications] = useState<InboxNotification[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load archived notifications from localStorage after component mounts
  useEffect(() => {
    const saved = localStorage.getItem("archivedNotifications");
    if (saved) {
      setArchivedNotifications(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  const { notifications, actions, showMoreMenu, hideMoreActions, isLoading } =
    useInboxActions(archivedNotifications, (updatedNotifications) => {
      // Update localStorage when archived notifications change
      localStorage.setItem(
        "archivedNotifications",
        JSON.stringify(updatedNotifications)
      );
      setArchivedNotifications(updatedNotifications);
    });



  const clearAllArchived = () => {
    localStorage.removeItem("archivedNotifications");
    setArchivedNotifications([]);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Filter and Sort Controls */}
      <div
        className="flex items-center justify-end mb-6 pb-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <FilterSortControls />
      </div>

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={clearAllArchived}
            className="px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-gray-50"
            style={{
              color: theme.text.secondary,
              borderColor: theme.border.default,
            }}
          >
            Clear all archived
          </button>
        </div>
      )}

      {/* Archived Notifications */}
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
              <span className="text-2xl">📁</span>
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              No archived notifications
            </h3>
            <p>Notifications you archive will appear here.</p>
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

export default ArchivePage;
