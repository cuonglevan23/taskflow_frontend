"use client";

import React from "react";
import { DARK_THEME } from "@/constants/theme";
import { FileText } from "lucide-react";

export default function UserPostsPage() {
  return (
    <div className="p-6">
      <div
        className="text-center py-12 rounded-lg"
        style={{ backgroundColor: DARK_THEME.background.secondary }}
      >
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.primary }}>
          Posts
        </h3>
        <p style={{ color: DARK_THEME.text.secondary }}>
          User posts will be displayed here
        </p>
      </div>
    </div>
  );
}
