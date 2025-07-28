"use client";

import React from "react";
import { Bookmark, Star } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

const BookmarksPage = () => {
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
          <Bookmark
            className="w-8 h-8"
            style={{ color: theme.text.secondary }}
          />
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.text.primary }}
        >
          No bookmarked notifications
        </h2>
        <p className="max-w-md mx-auto" style={{ color: theme.text.secondary }}>
          Bookmarked notifications will appear here. Star any notification to
          bookmark it for later.
        </p>
      </div>
    </div>
  );
};

export default BookmarksPage;
