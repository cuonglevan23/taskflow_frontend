"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const MessagesPage = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center py-12">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          Messages
        </h2>
        <p
          className="text-sm"
          style={{ color: theme.text.secondary }}
        >
          Team messages and conversations will appear here.
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;