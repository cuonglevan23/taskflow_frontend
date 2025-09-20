"use client";

import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

const getGreeting = (t: (key: string) => string): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t('dashboard.greeting.morning');
  if (hour >= 12 && hour < 18) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
};

export default function GreetingHeader() {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

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
        {getGreeting(t)},
      </h1>
    </div>
  );
}
