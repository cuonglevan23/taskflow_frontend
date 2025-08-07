"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const AllWorkPage = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center py-12">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          All Work
        </h2>
        <p
          className="text-sm"
          style={{ color: theme.text.secondary }}
        >
          This section will contain all team work items, projects, and tasks.
        </p>
      </div>
    </div>
  );
};

export default AllWorkPage;