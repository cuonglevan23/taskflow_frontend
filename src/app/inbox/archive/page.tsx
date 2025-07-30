"use client";

import React from "react";
import { Archive, FolderOpen } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

const ArchivePage = () => {
  const { theme } = useTheme();

  return (
    <div
      className="p-6 max-w-5xl mx-auto"
      style={{ backgroundColor: theme.background.primary, minHeight: "100vh" }}
    >
      <div className="text-center py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <Archive
            className="w-8 h-8"
            style={{ color: theme.text.secondary }}
          />
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.text.primary }}
        >
          No archived notifications
        </h2>
        <p className="max-w-md mx-auto" style={{ color: theme.text.secondary }}>
          Archived notifications will appear here. Archive any notification to
          remove it from your main inbox.
        </p>
      </div>
    </div>
  );
};

export default ArchivePage;
