"use client";

import React from "react";
import InboxSummary from "./components/InboxSummary";
import InboxNotificationItem from "./components/InboxNotificationItem";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useInboxActions, InboxNotification } from "./hooks/useInboxActions";
import FilterSortControls from "./components/FilterSortControls";

// Mock data for notifications
const mockNotifications: InboxNotification[] = [
  {
    id: "1",
    type: "task",
    title: "Schedule kickoff meeting",
    time: "24 - 28 Jul",
    isRead: false,
  },
  {
    id: "2",
    type: "system",
    title: "Enjoy Asana Advanced for 14 days",
    content:
      "Hi levancuong! For 14 days, you get the Asana Advanced plan. With Advanced, you'll enjoy all of Asana's features, like using portfolios to...",
    time: "7 days ago",
    isRead: false,
    avatar: "Yeti",
  },
  {
    id: "3",
    type: "system",
    title: "Teamwork makes work happen!",
    content:
      "Inbox is where you get updates, notifications, and messages from your teammates. Send an invite to start collaborating.",
    time: "8 days ago",
    isRead: false,
    avatar: "Yeti",
  },
];

const InboxPage = () => {
  const { theme } = useTheme();

  const { notifications, actions, showMoreMenu, hideMoreActions, isLoading } =
    useInboxActions(mockNotifications, (updatedNotifications) => {
      console.log("Notifications updated:", updatedNotifications);
    });

  const handleNotificationClick = (notification: InboxNotification) => {
    console.log("Notification clicked:", notification);
  };

  // Group notifications for display
  const taskNotifications = notifications.filter((n) => n.type === "task");
  const systemNotifications = notifications.filter((n) => n.type === "system");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Filter and Sort Controls */}
      <div
        className="flex items-center justify-end mb-6 pb-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <FilterSortControls />
      </div>

      {/* Inbox Summary */}
      <InboxSummary />

      {/* Past 7 Days Section */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Past 7 Days
        </h2>

        {/* Your tasks for 24 Jul */}
        {taskNotifications.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.button.primary.background }}
              ></div>
              <h3
                className="font-medium"
                style={{ color: theme.text.secondary }}
              >
                Your tasks for 24 Jul
              </h3>
            </div>

            <div className="space-y-1">
              {taskNotifications.map((notification) => (
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
          </div>
        )}

        {/* System notifications */}
        {systemNotifications.length > 0 && (
          <div className="space-y-1">
            {systemNotifications.map((notification) => (
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
        )}
      </div>

      {/* Earlier Section */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Earlier
        </h2>

        {notifications.length === 0 ? (
          <div className="text-center py-8" style={{ color: theme.text.muted }}>
            <p>No older notifications</p>
          </div>
        ) : (
          <div className="text-center py-4" style={{ color: theme.text.muted }}>
            <p>Archive all notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
