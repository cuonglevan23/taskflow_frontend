"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const TeamGoals = () => {
  const { theme } = useTheme();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          Goals
        </h2>
        <button
          className="px-3 py-1.5 text-sm rounded-md transition-colors"
          style={{
            backgroundColor: theme.button.primary.background,
            color: theme.button.primary.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.button.primary.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.button.primary.background;
          }}
        >
          Create goal
        </button>
      </div>

      <div
        className="p-6 rounded-lg border text-center"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
        }}
      >
        <h3
          className="font-medium mb-2"
          style={{ color: theme.text.primary }}
        >
          This team hasn't created any goals yet
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: theme.text.secondary }}
        >
          Add a goal so the team can see what you hope to achieve.
        </p>

        {/* Progress placeholder */}
        <div className="flex items-center gap-2 justify-center mb-4">
          <div
            className="h-2 w-32 rounded-full"
            style={{ backgroundColor: theme.background.primary }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#10B981" }}
          />
          <span
            className="text-sm"
            style={{ color: theme.text.secondary }}
          >
            On track (0%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamGoals;