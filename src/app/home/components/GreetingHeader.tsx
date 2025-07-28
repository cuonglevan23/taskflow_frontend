"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function GreetingHeader() {
  const { theme } = useTheme();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <p className="text-sm" style={{ color: theme.text.secondary }}>
        {today}
      </p>
      <h1
        className="text-2xl font-semibold"
        style={{ color: theme.text.primary }}
      >
        {getGreeting()}, Alienn704
      </h1>
    </div>
  );
}
