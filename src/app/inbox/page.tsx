"use client";

import React, { useState } from "react";
import InboxSummary from "./components/InboxSummary";
import {
  ACTION_ICONS,
  STATUS_ICONS,
  FILE_ICONS,
  LAYOUT_ICONS,
  USER_ICONS,
} from "@/constants/icons";
import { useTheme } from "@/layouts/hooks/useTheme";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content?: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    type: "task",
    title: "Schedule kickoff meeting",
    time: "24 Jul - Today",
    isRead: false,
  },
  {
    id: "2",
    type: "task",
    title: "Schedule kickoff meeting",
    time: "24 Jul - Today",
    isRead: false,
  },
  {
    id: "3",
    type: "project",
    title: "Draft project brief",
    time: "23 - 25 Jul",
    isRead: false,
  },
  {
    id: "4",
    type: "message",
    title: "Hi levancuong, your favorite tools are here",
    content: "Integrate your top tools for Engineering in a few clicks.",
    time: "4 days ago",
    isRead: false,
    avatar: "A",
  },
  {
    id: "5",
    type: "reminder",
    title: "Enjoy Asana Advanced for 14 days",
    time: "5 days ago",
    isRead: false,
  },
];

const InboxPage = () => {
  const { theme, isDark } = useTheme();

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconStyle = {
      color: isRead ? theme.text.muted : theme.text.secondary,
    };

    switch (type) {
      case "task":
        return <STATUS_ICONS.success className="w-4 h-4" style={iconStyle} />;
      case "project":
        return <FILE_ICONS.document className="w-4 h-4" style={iconStyle} />;
      case "message":
        return <STATUS_ICONS.info className="w-4 h-4" style={iconStyle} />;
      case "reminder":
        return <STATUS_ICONS.pending className="w-4 h-4" style={iconStyle} />;
      default:
        return <STATUS_ICONS.info className="w-4 h-4" style={iconStyle} />;
    }
  };

  const getAvatarContent = (item: NotificationItem) => {
    if (item.avatar) {
      return (
        <div
          className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: theme.button.primary.background }}
        >
          {item.avatar}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="p-6 max-w-5xl mx-auto"
      style={{
        backgroundColor: theme.background.primary,
        minHeight: "100vh",
      }}
    >
      {/* Inbox Summary */}
      <InboxSummary />

      {/* Today Section */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Today
        </h2>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.button.primary.background }}
            ></div>
            <h3 className="font-medium" style={{ color: theme.text.secondary }}>
              Your tasks for today
            </h3>
          </div>

          <div className="space-y-2">
            {mockNotifications.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.background.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {getNotificationIcon(item.type, item.isRead)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: theme.text.primary }}
                    >
                      {item.title}
                    </p>
                    <span
                      className="text-xs ml-2 whitespace-nowrap"
                      style={{ color: theme.text.muted }}
                    >
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past 7 Days Section */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Past 7 Days
        </h2>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.button.primary.background }}
            ></div>
            <h3 className="font-medium" style={{ color: theme.text.secondary }}>
              Your tasks for 25 Jul
            </h3>
          </div>

          <div className="space-y-2">
            <div
              className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FILE_ICONS.document
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: theme.text.primary }}
                  >
                    Draft project brief
                  </p>
                  <span
                    className="text-xs ml-2 whitespace-nowrap"
                    style={{ color: theme.text.muted }}
                  >
                    23 - 25 Jul
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-3 p-3 rounded-lg transition-colors mb-4 cursor-pointer"
          style={{
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <STATUS_ICONS.info
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-medium"
                style={{ color: theme.text.primary }}
              >
                Hi levancuong, your favorite tools are here
              </p>
              <span
                className="text-xs ml-2 whitespace-nowrap"
                style={{ color: theme.text.muted }}
              >
                4 days ago
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
              Integrate your top tools for Engineering in a few clicks.
            </p>
          </div>
          <div
            className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: theme.button.primary.background }}
          >
            A
          </div>
        </div>

        <div
          className="flex items-start gap-3 p-3 rounded-lg transition-colors mb-4 cursor-pointer"
          style={{
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <STATUS_ICONS.pending
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-medium"
                style={{ color: theme.text.primary }}
              >
                Enjoy Asana Advanced for 14 days
              </p>
              <span
                className="text-xs ml-2 whitespace-nowrap"
                style={{ color: theme.text.muted }}
              >
                5 days ago
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.button.primary.background }}
            ></div>
            <h3 className="font-medium" style={{ color: theme.text.secondary }}>
              Your tasks for 24 Jul
            </h3>
          </div>

          <div className="space-y-2">
            <div
              className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <STATUS_ICONS.success
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm font-medium"
                    style={{ color: theme.text.primary }}
                  >
                    Schedule kickoff meeting
                  </p>
                  <span
                    className="text-xs ml-2 whitespace-nowrap"
                    style={{ color: theme.text.muted }}
                  >
                    24 Jul - Today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
          style={{
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <STATUS_ICONS.info
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-medium"
                style={{ color: theme.text.primary }}
              >
                Enjoy Asana Advanced for 14 days
              </p>
              <span
                className="text-xs ml-2 whitespace-nowrap"
                style={{ color: theme.text.muted }}
              >
                5 days ago
              </span>
            </div>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.button.primary.background }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
