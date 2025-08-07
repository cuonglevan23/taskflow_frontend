"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const TeamSummary = () => {
  const { theme } = useTheme();

  return (
    <div className="mb-8">
      {/* Team Header with Avatar */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
            style={{ backgroundColor: "#8B5CF6" }}
          >
            L
          </div>
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: theme.text.primary }}
            >
              LÊ's first team
            </h1>
            <p
              className="text-base cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: theme.text.secondary }}
            >
              j
            </p>
          </div>
        </div>

        {/* Create Work Button */}
        <button
          className="px-4 py-2 text-sm rounded-md transition-colors"
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
          Create work
        </button>
      </div>

      {/* Setup Progress */}
      <div
        className="rounded-lg p-6 border"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: "#10B981" }}
            >
              ○
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              Finish setting up your team
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              1 of 3 steps completed
            </span>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => console.log("Close setup")}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add team description */}
          <div
            className="p-5 rounded-lg border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: "#10B981" }}
              >
                ✓
              </div>
              <div>
                <h4
                  className="font-semibold mb-2"
                  style={{ color: theme.text.primary }}
                >
                  Add team description
                </h4>
                <p
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  Describe your team's purpose and responsibilities
                </p>
              </div>
            </div>
          </div>

          {/* Add work */}
          <div
            className="p-5 rounded-lg border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: "#6B7280" }}
              >
                📋
              </div>
              <div>
                <h4
                  className="font-semibold mb-2"
                  style={{ color: theme.text.primary }}
                >
                  Add work
                </h4>
                <p
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  Link existing projects, portfolios, or templates your team may find helpful
                </p>
              </div>
            </div>
          </div>

          {/* Add teammates */}
          <div
            className="p-5 rounded-lg border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: "#6B7280" }}
              >
                👥
              </div>
              <div>
                <h4
                  className="font-semibold mb-2"
                  style={{ color: theme.text.primary }}
                >
                  Add teammates
                </h4>
                <p
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  Start collaborating by inviting teammates to your new team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSummary;