"use client";

import React, { useState } from "react";
import { ACTION_ICONS } from "@/constants/icons";
import { useTheme } from "@/layouts/hooks/useTheme";

const InboxSummary = () => {
  const [timeframe, setTimeframe] = useState("Past week");
  const [showSummary, setShowSummary] = useState(true);
  const { theme, mode } = useTheme();
  const isDark = mode === "dark";

  if (!showSummary) return null;

  return (
    <div
      className="rounded-lg p-4 relative border"
      style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default,
        color: theme.text.primary,
      }}
    >
      <button
        onClick={() => setShowSummary(false)}
        className="absolute top-4 right-4 transition-colors"
        style={{
          color: theme.text.muted,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.text.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.text.muted;
        }}
      >
        <ACTION_ICONS.close className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
          style={{ backgroundColor: "#f59e0b" }}
        >
          <span className="text-white text-xs">✦</span>
        </div>
        <div className="flex-1">
          <h3
            className="font-semibold mb-1"
            style={{ color: theme.text.primary }}
          >
            Inbox Summary
          </h3>
          <p className="text-sm mb-4" style={{ color: theme.text.secondary }}>
            Summarize your most important and actionable notifications with
            Asana AI.
          </p>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none border rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    backgroundColor: theme.background.primary,
                    borderColor: theme.border.default,
                    color: theme.text.primary,
                    "--tw-ring-color": theme.border.focus,
                  } as React.CSSProperties
                }
              >
                <option>Past week</option>
                <option>Past month</option>
                <option>Past 3 months</option>
              </select>
              <ACTION_ICONS.down
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: theme.text.secondary }}
              />
            </div>

            <button
              className="px-4 py-1.5 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: theme.button.primary.background,
                color: theme.button.primary.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.button.primary.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.button.primary.background;
              }}
            >
              View summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxSummary;
