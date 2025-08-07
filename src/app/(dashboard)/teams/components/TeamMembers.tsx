"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const TeamMembers = () => {
  const { theme } = useTheme();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          Members
        </h2>
        <button
          className="text-sm transition-colors hover:opacity-80"
          style={{ color: theme.text.secondary }}
        >
          View all 1
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Current user */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: "#EC4899" }}
        >
          LC
        </div>

        {/* Add member button */}
        <button
          className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-xl transition-colors hover:opacity-80"
          style={{
            borderColor: theme.border.default,
            color: theme.text.secondary,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TeamMembers;