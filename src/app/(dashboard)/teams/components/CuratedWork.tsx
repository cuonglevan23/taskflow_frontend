"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const CuratedWork = () => {
  const { theme } = useTheme();

  const workItems = [
    {
      id: 1,
      icon: "📊",
      title: "Sample Project",
      description: "A sample project to get started",
      color: "#10B981",
    },
    {
      id: 2,
      icon: "📋",
      title: "Team Portfolio",
      description: "Track all team projects in one place",
      color: "#3B82F6",
    },
    {
      id: 3,
      icon: "📁",
      title: "Team Resources",
      description: "Important documents and templates",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          Curated work
        </h2>
        <button
          className="text-sm transition-colors hover:opacity-80"
          style={{ color: theme.text.secondary }}
        >
          View all work
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {workItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
            style={{
              backgroundColor: theme.background.secondary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <h3
                className="font-medium"
                style={{ color: theme.text.primary }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm"
                style={{ color: theme.text.secondary }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p
          className="text-sm mb-4"
          style={{ color: theme.text.secondary }}
        >
          Organize links to important work such as portfolios, projects, templates, etc. for your team members to find easily.
        </p>
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
          Add work
        </button>
      </div>
    </div>
  );
};

export default CuratedWork;